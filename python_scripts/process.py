## @Author : Guillaume Bordus

import json
import sys
reload(sys)
sys.setdefaultencoding("utf-8")

import re

import logging

from flask import Flask, render_template, request, Response, json
from wikitools import wiki, page, category

# scikit-learn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import time
from stop_words import get_stop_words

'''
{
    "firstCorpus":[
                    {"title":"titre",
                    "content":"contenu"}
                  ],
    "secondCorpus":[
                    {"cat_pageId":"pageid de la category",
                     "cat_title":"titre de la category",
                     "articles":
                        [
                            {"pageid":"pageid de l'article",
                             "title":"titre de l'article",
                             "content":"contenu de l'article"
                            }
                    ]}]
}

'''

def main():
	#Chargement de la source JSON (format exemple ci dessus)
	json_data = "\n".join(sys.stdin)
	
	#Conversion JSON des donnes entrees
	data = json.loads(json_data)
	firstCorpus = data["firstCorpus"]
	secondCorpus = data["secondCorpus"]

	dictArticle = dict()
	listArticleReference = []
	listArticle = []
	listCatGlobal = []
	corpusReference = []
	listSubCat = []
	dictArticle = dict()

	#Chargement des corpus et affichage de ces derniers
	#print "TAILLE PREMIER CORPUS = ", len(firstCorpus), "\n", firstCorpus 
	#print "TAILLE SECOND CORPUS = ", len(secondCorpus), "\n", secondCorpus 
	score = data["score"]

	#Affichage de tous les titres et contenus du premier corpus
	for article in firstCorpus:
		#print "TITRE = ", article["title"] ," // ", "CONTENU = ", article["content"]
		listArticleReference.append(article["title"])
		corpusReference.append(article["content"])

	#Affichage subcategories dans second corpus
	for category in secondCorpus:
		#print "TITRE = ", category["cat_title"]
		listSubCat.append(category)
	'''	
	#Affichage de tous les articles dans une subcategorie
		for article in category["articles"]:
			print "TITRE = ", article["title"]
	'''

	dictArticleReference = getDictReference(listArticleReference)

	listWord = getListWordsFromCorpus(corpusReference)

	vectorReference = getTfIdfVectorFromCorpus(listArticleReference, listWord)

	for cat in listSubCat:
		dictArticle.update(getArticlesRelevant(cat, score, vectorReference, listWord))

	
	return dictArticle




def getArticlesRelevant(nameCat, score, vectorReference, listWord):	
	dictArticle = dict()
	listScore = []

	for article in nameCat["articles"]:
		scoreArticle = getCosineSimilarityOfAnArticleWithVector(vectorReference, article["content"], listWord)
		listScore.append(scoreArticle)

		if(float(scoreArticle)>=float(score)):
			data = {}
			data['cat_pageId'] = nameCat["cat_pageId"]
			data['pageid'] = article["pageid"]
			json_data = json.dumps(data)
			print(article["pageid"])
			#addArticleInDict(dictArticle, article["title"], str(scoreArticle))

	if(len(listScore)>0):
		scoreMoy = 0
		for scoreInList in listScore:
			scoreMoy += scoreInList
		scoreMoy = scoreMoy/len(listScore)
	else:
		scoreMoy = 1

	'''

	if(float(scoreMoy)>=float(score)):
		for cat in listSubCat:
			dictArticle = addArticlesInDict(dictArticle, getArticlesRelevant(cat, score, vectorReference, listWord))

	logger.info("Fin fonction getArticlesRelevant")
	'''
	return dictArticle


def getDictReference(listArticle):
	
	dictRef = dict()
	for titre in listArticle:
		dictRef.update({titre:1})

	return dictRef

def getListWordsFromCorpus(corpus):

	setWord = set()
	for t in corpus:
		setWord.update(t.split(" "))
	
	return setWord

def getTfIdfVectorFromCorpus(corpus, listWord):

	vectorizer = TfidfVectorizer(analyzer='word', vocabulary=listWord)
	
	resultVectorCorpus = vectorizer.fit_transform(corpus)
	matriceTfIdfCorpus = resultVectorCorpus.toarray()

	return matriceTfIdfCorpus

def addArticlesInDict(currDict, newArticleDict):
	
	for key, value in newArticleDict.iteritems():
		currDict = addArticleInDict(currDict, key, value)

	return currDict

def getCosineSimilarityOfAnArticleWithVector(matriceTfIdfCorpus, article, listWord):

	cosineSimilarity = 0
	vectorizer = TfidfVectorizer(analyzer='word', vocabulary=listWord)
	
	resultVectorArticle = vectorizer.fit_transform([article])
	matriceTfIdfArticle = resultVectorArticle.toarray()

	cs = cosine_similarity(matriceTfIdfCorpus, matriceTfIdfArticle)

	valTmp = 0
	for val in cs:
		valTmp += val
	score = valTmp/len(cs)

	return score[0]


if __name__ == '__main__':
    main()