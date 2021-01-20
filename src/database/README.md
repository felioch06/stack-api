# Seeders

Dentro de la carpeta `seeders` **solo** es permitido agregar los `JSON` a insertar en la base de datos.

El nombre del archivo debe ser el nombre de la tabla pero en `kebab-case`.  
Por ejemplo: tabla `user` - seeder `user.json`, tabla `systemCity` - seeder `system-city`.

En el contenido del archivo debe haber un array de objetos (Siempre es necesario esto, así sea la insersión de un solo elemento). Cada columna necesaria para la insersión debe estar en un key del objeto. Cada objeto es una insersión.
