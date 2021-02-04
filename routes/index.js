let express = require('express');
let path = require('path');
let router = express.Router();
let bot = require('nodemw');
let async = require('async');
let txtwiki = require('txtwiki');
let stopwords = require('nltk-stopwords');
let english = stopwords.load('english');
const _ = require("underscore");
const PythonShell = require('python-shell');


/**==========================================*\
 Définition des constantes
 ============================================*/

const nameSpaceNotArticle = [2,4,6,8,10,12,14,100,108,118,446,710,828,2300,2302];
const nameSpaceCat = 14;



/*
CONSTRUCTION DU PREMIER CORPUS :

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
*/


/**==========================================*\
 PROCESS PYTHON
 ============================================*/

//let pyshell = new PythonShell('testJson.py', { mode: 'json '});


function callProcessPython(data)
{
    return new Promise(function(resolve, reject) {
        console.log("START : Processing Python");
        let pyshell = new PythonShell('./python_scripts/process.py', {pythonPath : 'python'});
        listPageIdPostProcessPython = []
        pyshell.send(JSON.stringify(data), { mode: 'json' });
        pyshell.on('message', function (message) {
          listPageIdPostProcessPython.push(deleteReturnFromArray(message));
        });
        
        pyshell.end(function (err,code,signal) {
               if (err){
                throw err;
        }
          resolve(listPageIdPostProcessPython)
        }); 
    });
}


/**==========================================*\
 CONFIGURATION du Client API MediaWiki
 ============================================*/

let client = new bot({
    protocol: 'https', // Wikipedia now enforces HTTPS
    server: 'en.wikipedia.org', // host name of MediaWiki-powered site
    path: '/w', // path to api.php script
    debug: false, // is more verbose when set to true
    concurrency : 6
});

/*Routage fait référence à la définition de points finaux d’application (URI) 
et à la façon dont ils répondent aux demandes client. Pour une introduction au routage*/

/* GET search page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../public', 'views', 'search.html'));
});


/**==========================================*\
 FONCTIONS Traitement Données
 ============================================*/

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function deleteReturnFromArray(str){
  while (str.includes('\r')) {
        str = str.replace('\r', '')
    }
    return str;
}


function jsonToArray(jsonData) {
    console.log(JSON.stringify(jsonData));
    return JSON.stringify(jsonData);
}

function deleteStopWords(stringZer) {
    return stringZer=stopwords.remove(stringZer, english)
}


function deleteParasiteChars(str){

    while (str.includes('{{')) {
        str = str.replace('{{', '')
    }
    while (str.includes('}}')) {
        str = str.replace('}}', '')
    }
    while (str.includes('===')) {
        str = str.replace('===', '')
    }
    while (str.includes('==')) {
        str = str.replace('==', '')
    }
    while (str.includes('=')) {
        str = str.replace('=', '')
    }
    while (str.includes('|')) {
        str = str.replace('|', '')
    }
    while (str.includes('—')) {
        str = str.replace('—', '')
    }
    while (str.includes('*')) {
        str = str.replace('*', '')
    }
    while (str.includes('.jpg')) {
        str = str.replace('.jpg', '')
    }
    while (str.includes('.gif')) {
        str = str.replace('.gif', '')
    }
    while (str.includes('.png')) {
        str = str.replace('.png', '')
    }
    while (str.includes('\n')) {
        str = str.replace('\n', '')
    }
    while (str.includes('&nbsp;')) {
        str = str.replace('&nbsp;', '')
    }

    return str;
}


function wikiTextToPlainText(dataZer) {
    return dataZer=txtwiki.parseWikitext(dataZer);
}

function cleanMyStr(data)
{
    data=wikiTextToPlainText(data);
    data=deleteParasiteChars(data);
    data=deleteStopWords(data);
    return data;
}


/**==========================================*\
 FONCTIONS API MediaWiki
 ============================================*/
let listeArticles = [];
let listeSubCat = [];
let itemsProcessed;
let NB_ARTICLES;

/**==========================================*\
 getArticlesInCategory
 Description : Creation d'une liste d'article avec leurs titre et leurs contenus  à l'aide d'un titre de catégorie
 ============================================*/
let getArticlesInCategory = function(category) {
    console.log("Building First Corpus // getArticlesInCategory :  " + category)
    return new Promise(function(resolve, reject) {
        listeArticles = [];
        client.getArticlesInCategory(category, function(err, pages) {
            NB_ARTICLES = pages.length;
            async.everyLimit(pages, 30, getArticles, function(err, data) {
                resolve(listeArticles);
            });
            if (err) {
                console.error(err);
                reject(err)
            }
        });
    })
}


/**==========================================*\
 getArticlesInCategoryByPageid
 Description : Creation d'une liste d'article avec leurs titre et leurs contenus à l'aide d'un pageid
 ============================================*/
let getArticlesInCategoryByPageid = function(cat_pageid) {
    console.log("-- getArticlesInCategoryByPageid -- // Category PageId : " + cat_pageid);
    return new Promise(function(resolve, reject) {
        client.getArticlesInCategoryByPageid(cat_pageid, function(err, pages) {
            async.mapLimit(pages.map(x => _.extend(x,{ category : cat_pageid })), 30, getArticlesSubCat, function(err, data) {
                resolve(data);            
            })
        });
    })
}

/**==========================================*\
 x : getArticles
 Description : Création d'une liste comprenant tous les contenus, titres et pages id des articles d'une catégorie.
 ============================================*/
 let getArticles = function(pages, callback) {
    client.getArticle(pages.title, function(err, content) {
        
        if (err) {
            console.log("erreur getArticles");
            console.error(err);
            callback()
            return;
        }

        let namespace = pages.ns;
        let titre = pages.title;
        if (!(nameSpaceNotArticle.indexOf(namespace) !== -1) && (titre.indexOf("List of") == -1)) {
            console.log("getArticles -- // TITLE : " + pages.title);
                if(!listeArticles.some(item => item.title === pages.title))
                {
                        let contentCleaned = cleanMyStr(content);
                        let innerObj = {
                          title: pages.title,
                          content: contentCleaned
                        };
                        listeArticles.push(innerObj)
                }

            if (listeArticles.length == NB_ARTICLES - 1) {
                console.log("On s'arrête");
                callback(err = true, listeArticles);
            } else {
                callback(null, listeArticles);
            }
        }

    });

}

/**==========================================*\
 x : getArticlesSubCat
 Description : Création d'une liste comprenant tous les contenus, titres et pages id des articles des sous catégories d'une catégorie.
 ============================================*/
let getArticlesSubCat = function(pages, callback) {
    console.log("getArticlesSubCat -- // TITLE : " + pages.title);
    client.getArticle(pages.title, function(err, content) {
        if (err) {
            console.log("erreur getArticlesSubCat")
            console.error(err);
            callback()
            return;
        }

        let namespace = pages.ns;
        let titre = pages.title;
        let pageid = pages.pageid;

        if(titre.indexOf("List of") == -1) {
                let innerItem = {
                    pageid: pageid,
                    title: pages.title,
                    content: cleanMyStr(content)
                }
                 _.findWhere(listeSubCat, { cat_pageId: pages.category }).articles.push(innerItem)

            callback(null, innerItem);
        }else{
            callback(null)
        }
    });
}



/**==========================================*\
 /**==========================================*\
 POST API CALL ORDER :
 /**==========================================*\
 ============================================*/

/**==========================================*\
 1 : createJsonSecondCorpus
 Description : Création d'un fichier JSON contenant le corpus initial, et le corpus des articles des sous catégories de la catégorie du corpus initial
 ============================================*/
const createJsonSecondCorpus = function (category) {
    return new Promise(function(resolve, reject) {
        getArticlesInCategory(category)
            .then(getSubCategories(category))
            .then(createSubCatCorpus)
            .then(resolve)
            .then(fulfilled => console.log("fulfilled"))
            .catch(error => console.log(error.message));
    });
};


/**==========================================*\
 2 : getSubCategories
 Description : Récupération de toutes les sous-catégories (cat_pageid, cat_title) potentielle d'une catégories
 ============================================*/
const getSubCategories = function(category) {
    return new Promise(function(resolve, reject) {
        listeSubCat = [];
        console.log("-- START -- getSubCategories -- // category title = " + category);

        client.getSubCategories(category, function(err, pages) {

            pages.forEach(function(page) {
                let title = page.title;
                title = title.replace(/Category:/g, '');
                if((title.indexOf("Lists of") == -1)&&(title.indexOf("List of") == -1)){
                    let innerObj = {
                        cat_pageId: page.pageid,
                        cat_title: title,
                        articles : []
                    };
                    listeSubCat.push(innerObj);
                }
            });
            console.log("-- END --  getSubCategories -- ");
            resolve(listeSubCat);
        });
    });
};



/**==========================================*\
 3 : createSubCatCorpus
 Description :
 ============================================*/
const createSubCatCorpus = function () {
    return new Promise(function(resolve, reject) {
        console.log("-- START -- createSubCatCorpus -- ");
        itemsProcessed=0;

        listeSubCat.forEach((item, index, array) => {
            getArticlesInCategoryByPageid(item.cat_pageId).then( (listeArticles) => {
                itemsProcessed++;
                if(itemsProcessed === listeSubCat.length) {
                    console.log("-- END --  createSubCatCorpus -- ");
                    resolve(listeSubCat);
                }
            });
        });

    })

}


/**====================================*\
 *  URI : /API/TAGS
 METHODS REST
 ======================================*/

router.post('/api/tags', function(req, res, next) {
    let tags = [];
    if (req.body !== undefined) {
                //Formattage des tags
                //tags.push(capitalizeFirstLetter(items.text));
                //Isolation des tags dans une array, on devrait ensuite traiter cette array pour la vérifier selon les modalités imposées
                createJsonSecondCorpus(req.body.tags).then(function(data) {
                    if(data.length<1)
                    {
                        data = "There seems to be no results for the category you typed, please try again";
                    }
                    let scoreBody;
                    if(req.body.dice_coeff == undefined)
                    {
                        scoreBody = 0;
                    }
                    else
                    {
                        scoreBody = req.body.dice_coeff;
                    }

                    let finalListe = {
                        score : scoreBody,
                        firstCorpus : listeArticles,
                        secondCorpus : listeSubCat
                    };

                    callProcessPython(finalListe).then(function(value) {
                        listPostPython = []
                        value.forEach(function(element) {
                          _.each(listeSubCat, function(val, key) {
                                _.each(val["articles"], function(val, key) {
                                    if (val["pageid"] == element) {
                                        if(!listPostPython.some(item => item.pageid == element)){
                                           console.log("Articles similaire trouvé : ", val["title"])
                                            listPostPython.push(val) 
                                        }
                                    }

                                });
                        });
                        });                        
                        res.render(path.join(__dirname, '../public', 'views', 'search.html'));
                        res.send({data: listPostPython});
                    }).catch(function(err) {
                    console.error(err);
                });

                }).catch(function(err) {
                    console.error(err);
                });
    } else {
        console.log("erreur, pas de req.body")
        res.send("erreur, pas de req.body")
    }

});

module.exports = router;