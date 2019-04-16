# TaskDaddy

(Je développe cette application avec un group de 3 autres étudiants - un développeur et 2 graphistes - dans le cadre d'un cours d'entrepreneuriat. TaskDaddy est en développement depuis fin Janvier, et nous l'avons présenté en cours début Avril. Le lancement est prévu pour début Septembre.)

TaskDaddy est un application qui cherche a améliorer la productivité de ses utilisateurs en proposant une plateforme qui combine les aspects d'un Reminders intelligent avec un réseau social. Notre design minimaliste s'inspire d'applications telles que Reminders et Notes pour offrir une experience simple et intuitive.
La fonctionnalité innovatrice que propose TaskDaddy est l'introduction de tasks monétisées. Cette fonction permet aux utilisateurs de parier une somme entre 5$ et 15$ pour une task. Si l'utilisateur finit cette task avant qu'elle expire, il récupère la somme misée. Si l'utilisateur n'arrive pas à compléter la task a temps, la somme est envoyee a une charité. 

La page principale de TaskDaddy est le Home. Ici, chaque utilisateur peut voir leur tasks organisées par leur date de complétion. Chaque task peut être: complétée (elle apparait alors rayée et en gris), en retard (elle apparait alors en rouge), en cours de vérification (son symbole appparait alors en jaune) ou a compléter (son symbole est soit vert si la task est monétisée, ou un simple cercle). Pour compléter une task, un utilisateur doit simplement glisser vers la gauche sur le nom de la task. 

Il y a aussi un feed, dans lequel apparaissent les tasks récemment complétées par d'autres utilisateurs. 

Chaque utilisateur à aussi accès a leur Profile, dans lequel ils peuvent trouver des statistiques telles que leur taux de complétion de tasks, leur streak de tasks complétées, leurs follower, etc.

## A Propos

Nous avons développé TaskDaddy avec Expo, un framework de React-Native qui nous permet de coder l'application en JavaScript et de la publier sur l'App Store iOS et le Play Store; Redux, pour le data flow de l'application, et Firebase, un service NoSQL appartenant a Google pour notre database.

## Captures d'Ecran

![login screen] (screenshots/login.png)

![home screen] (https://raw.githubusercontent.com/olalliot/TaskDaddy-public/tree/master/screenshots/home.png)

![new task screen] (https://raw.githubusercontent.com/olalliot/TaskDaddy-public/tree/master/screenshots/new_task.png)

![task details screen] (https://raw.githubusercontent.com/olalliot/TaskDaddy-public/tree/master/screenshots/details.png)

![feed screen] (https://raw.githubusercontent.com/olalliot/TaskDaddy-public/tree/master/screenshots/feed.png)

![profile screen] (https://raw.githubusercontent.com/olalliot/TaskDaddy-public/tree/master/screenshots/profile.png)
