# Evaluacion 3

Como tercera evaluación, se ha de realizar un backend compuesto de varios servicios distribuidos, sirviendo la funcionalidad para una red social.

La API como tal debe exponer, como mínimo, el siguiente conjunto de funcionalidades:

* Registro e ingreso (autenticación) de usuarios
* Tipos de usuario (usuario normal y usuario administrador)
* Autorización (un usuario normal no debe poder hacer lo mismo que un administrador), los servicios deben validar que los usuarios que hacen peticiones son validos
* Funcionalidad de amigos (un usuario debe poder ser capaz de agregar a otros como amigos)
* Herramientas para los administradores (por ejemplo, borrar/bloquear un ususario)
* Creacion de posts (puro texto)
* Reaccionar a posts (con las reacciones de su preferencia)
* Comentar en posts (puro texto)


El diagrama de los servicios a realizar:

![Diagrama](./Class.drawio.png)


Para la implementación de la funcionalidad descrita arriba, deben implementar un minimo de dos servicios distintos, o más si lo considera necesario.

Estos servicios están detras de un proxy, este proxy debe redirigir al servicio respectivo en base al path de las peticiones que le lleguen.

Cada servicio debe tener base de datos propia. Asegúrese que use connection pooling a la hora de conectarse a una base de datos.

Todos los servicios a implementar deben mandar sus logs a un acumulador de logs (puede usar el stack ELK visto en clase u otro de su preferencia).

Los servicios deben estar contenedorizados, y deben poder desplegarse en conjunto a través de la herramienta docker-compose con un solo comando `docker-compose up`.

Debe implementar caching externo (a través de Redis, por ejemplo) en alguna parte de los servicios.
