# WikiCorpus

NodeJS app for PPD using Wikipedia's API

## Concept

An user can type one or more Wikipedia categories, qualified by the "tags" and the application returns him a corpus of suggested articles according to the tf-idf of the words found in the articles of the categories and subcategories that the user entered at the start.

---

# GIT

---

### COMMANDS POST INSTALL GIT

> - git config --global color.diff auto
> - git config --global color.status auto
> - git config --global color.branch auto
> - git config --global user.name "yourname"
> - git config --global user.email me@email.com

---

### **IMPORT THE PROJECT**

> - git clone https://github.com/ThPch/WikiCorpus.git

---

### **PULL THE PROJECT**

> - git status
>   _Consulter vos modifications_
> - git branch
>   _Afficher toutes les branches, l'étoile permet d'indiquer sur quelle branche vous vous situez_
> - git branch branchName
>   _Créer une branche_
> - git checkout dev
>   _Passer sur la branche dev_
> - git pull
>   _Update votre projet local avec la version hébergé sur Github_
> - git fetch
>   _Telecharger les nouveaux commits_
> - git merge
>   _Fusionne les commits téléchargés_

---

### **COMMIT & PUSH YOUR MODIFICATIONS**

#### Suivre les étapes suivantes :

1. Modification du code source (Ajout de fonctionnalité, correctifs de bugs)
2. Tester les fonctionnalités implémentés et vérifier le fonctionnement de ces dernières
3. Effectuer un **git commit** pour "enregistrer" localement les changements et les notifier à Git
4. Effectuer un **git log -p** pour consulter ce qui va être envoyé, vérifier que tout est bon, sinon se référer aux command line
5. Effectuer un **git pull** pour s'assurer d'avoir la dernière version du projet
6. Effectuer un **git push** pour envoyer vos commits (**_Attention_** _: Personne ne doit avoir fait un push avant vous depuis votre dernier pull_)
7. Recommencer à partir de l'étape numéro 1 pour chaque modifications

#### COMMAND LINE

> - git status
>   _Consulter vos modifications_
> - git checkout dev
>   _Passer sur la branche dev_
> - git diff
>   _Consulter les différences_
> - git add filename filename2
>   _Ajouter des fichiers au versionning_
> - git reset HEAD -- filename_to_delete
>   _Retirer un fichier qui a été ajouté_
> - git commit (-a permet d'ajouter les fichiers en vert)
> - _Dans les colonnes : "Changes to be committed" et "Changed but not updated", pour indiquer lors du commit quels fichiers précis doivent être « commités ». Faire :_
> - git commit filename filename2
> - git log (-p pour le détail des lignes qui ont été ajoutées/retirées dans chaque commit)
>   _Afficher l'historique des commits_
> - git reset HEAD^
>   _Annuler le dernier commit (**Attention** à cette commande)_
> - git checkout (namefile)
>   _Annuler les modifications des ou du fichiers avant commit et restaure le fichier avec son état pre-commit_
> - git revert numeroducommit
>   _Annule le push du commit avec un reverse commit_

---

### **MERGE THE PROJECT (ADVANCED USERS ONLY)**

> - git checkout master
>   _Aller sur la branche master pour merger la branche dev_
> - git merge dev
>   _Fusionner les commits de la branche dev avec la branche master_
> - git diff
>   _Consulter les différences_
> - git branch -d dev
>   _Supprimer la branche dev_

---

### **USEFUL COMMAND LINE**

> - git grep "madara"
>   _Rechercher le mot madara dans les fichiers sources du projet_
> - git grep -n "madara"
>   _Compte les occurences du mots madara dans les fichiers sources du projet_
> - Créer un .gitignore (exemple) :
>   project.xml

    dossier/temp.txt
    *.tmp
    cache/*
