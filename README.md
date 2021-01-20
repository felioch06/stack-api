# Stack API - Versión 2

### Clonar el stack

Los siguientes comandos deben ser usados para bajar el repositorio del stack.

```bash
# Clonado con submódulos
git clone --recursive git@bitbucket.org:kuboco/stack-apiv2.git <nombre-carpeta>

# Renombrar la url del stack a stack
git remote rename origin stack

# Agregar la url del proyecto
git remote add origin <url-proyecto>

# Subir cambios al repositorio proyecto
git push origin master

# Ir a la carpeta contenedora del submódulo src/app/models
# Cambiar la url del submódulo del stack al submódulo del proyecto
git remote set-url origin <url-modelos-proyecto>

# ------------------------
# Para bajar actualizaciones del stack:
git pull stack <rama-a-actualizar>
```

Una vez clonado el proyecto se debe ingresar al archivo `.gitmodules` y cambiar la url especificada allí por la url del modelo del proyecto a manejar.

Es **sumamente importante** recordar que **antes de iniciar** el trabajo se debe hacer `pull`, al igual, **antes de subir** cambios se debe hacer `pull`. Y es necesario dejar de usar los forzados (`-f`), puesto que a pesar de permitirte subir cambios, eso puede llegar a eliminar los cambios realizados por otro miembro del equipo.

### Uso del submódulo `models`

Sobre el submódulo en el repositorio **SOLO** se debe hacer `pull`, para evitar conflictos o errores.  
Adicionalmente, se debe clonar el repositorio de los modelos y trabajar sobre ese las actualizaciones. La idea es que sobre el repositoro de los modelos clonados se cambie el nombre de la url del stack a `stack` y se agregue la url del nuevo repositorio de modelos del proyecto como `origin`.

```bash
# Clonado de modelos del stack
git clone git@bitbucket.org:kuboco/stack-models.git <nombre-carpeta>

# Renombrar la url de los modelos del stack a stack
git remote rename origin stack

# Agregar la url de los modelos del proyecto
git remote add origin <url-modelos-proyecto>

# Subir cambios al repositorio de modelos del proyecto
git push origin master

# ------------------------
# Para bajar actualizaciones de modelos del stack:
git pull stack <rama-a-actualizar>
```

### Estructura del API

Estructura del stack:

```
  stack/
  |
  |- bin/
  |   |- execute-seeders.js   // Para ejecutar los seeders. NO modificable
  |
  |- environments/  // Para manejar las variables de entorno
  |
  |- src/
  |   |- api/
  |   |   |- exceptions/  // Maneja los objetos de error comunes para poderlos re-usar
  |   |   |- interfaces/
  |   |   |- middlewares/
  |   |   |- routes/
  |   |   |   |- v1/      // Maneja las rutas de la versión 1 del API
  |   |
  |   |- app/
  |   |   |- controllers/
  |   |   |   |- v1/      // Maneja las rutas de la versión 1 del API
  |   |   |- enums/       // Son las agrupaciones de constantes usadas en el app
  |   |   |- models/      // Son los submódulos usados para el API
  |   |   |- repositories/
  |   |
  |   |- boot/          // Cada archivo inicializa sus configuraciones. Ningún archivo es modificable
  |   |   |- app.ts
  |   |   |- typeorm.ts
  |   |
  |   |- config/        // Cada archivo importa sus configuraciones. Ningún archivo es modificable
  |   |   |- app.ts
  |   |   |- aws.ts
  |   |   |- database.ts
  |   |   |- lang.ts
  |   |   |- mail.ts
  |   |
  |   |- credentials/   // Almacena todos los archivos de credenciales del proyecto
  |   |
  |   |- database/
  |   |   |- seeders/
  |   |
  |   |- libraries/     // Almacena las librerías a usar
  |   |   |- core/      // Almacena las librerías básicas usadas por el stack. Ningún archivo es modificable
  |   |   |   |- typeorm/
  |   |   |   |   |- state-queries.ts       // Ayudas para hacer querys con el status
  |   |   |   |
  |   |   |   |- aws.ts
  |   |   |   |- file-helper.ts
  |   |   |   |- mailer.ts
  |   |   |   |- onboarding.ts    // Contiene todas las funciones disponibles para el uso del onboarding
  |   |   |   |- push-notifications.ts
  |   |   |   |- response.ts      // Ayudas para generar respuestas en el API
  |   |   |   |- token.ts         // Funciones para generar los token auth y access
  |   |
  |   |- resources/
  |   |   |- lang/      // Maneja todos los lenguajes usados en el API
  |   |   |   |- es/    // Lenguaje por defecto (Español)
  |   |   |
  |   |   |- views/     // Maneja todas las vistas usadas para el body de los correos
  |   |- index.ts       // Inicia todo. NO modificable
  |
  |- .editorconfig    // Para manejar la identación. NO modificable
  |- .eslintrc        // Reglas para asegurar que el código tenga un estilo estándar. NO modificable
  |- .gitignore
  |- .gitmodules
  |- .prettierrc      // También es para manejar el estilo de codificado. NO modificable
  |- base.sh          // Archivo a ejecutar cuando se hace deploy automático
  |- bitbucket-pipelines.yml
  |- nodemon.json     // Archivo para especificar cómo se debe ejecutar un proyecto en desarrollo
  |- package-lock.json
  |- package.json
  |- tsconfig.json    // Son las configuraciones de TypeScript
```

Cada carpeta contiene un README.md específico para dar una breve explicación de lo que hacen sus archivos.  
Si se tienen dudas al respecto, por favor notificar.

### Uso del API

#### Creación del Onboarding

El onboarding se maneja en una librería porque eso permite crear diferentes onboardings de diferentes modelos.  
Para crear un onboarding es necesario el uso básico de tres modelos (`x-setting-notification`, `x-token`, `x`), además de los modelos de `system-version`, `system-city` y `system-country`. Solo es necesario crear el controlador del onboarding y especificar los modelos a usar.

#### Headers

Por defecto los headers al no ser válidos generan un `http status code 500`, además, retornan un `code 120` para que el front pueda sacar al usuario de la sesión.  
Adicionalmente, si se planea usar los diferentes lenguajes disponibles en la aplicación, solo es necesario enviar el header `lang` con el lenguaje (ejemplo: `es`, `en`, `de`, etc), además de tener agregados los lenguajes en el API. En caso de que el lenguaje enviado no esté en el API, por defecto se enviarán las respuestas en `es`.

#### Librerías y el decorador @Service

Siempre que se crea una librería que sea una clase se debe decorar usando `@Service`. De esta manera no se tendrá que instanciar dicha clase en cada controlador o repositorio en el que se use.  
Ejemplo:

```typescript
// src/libraries
import { Service } from 'typedi';

@Service
export class MyLibrary {}

// src/app/controllers
// Para usar dicha libreria en un controlador, por ejemplo,
// no hace falta instanciarla
import { MyLibrary } from 'src/libraries/my-library';
import { Service } from 'typedi';

@Service
export class MyController {
  constructor(private myLibrary: MyLibrary) {} //
}
```

#### Repositorios

Typeorm viene con repositorios creados por defecto para cada modelo existente. La forma más simple de usar estos es mediante el método `getRepository` proveído por el mismo paquete.  
Ejemplo:

```typescript
@Service
export class Controller {
  // ...
  myMethod = (req, res) => {
    const userRepository = getRepository(User);
  };
  // ..
}
```

Los repositorios que vienen por defecto ya proveen funciones para encontrar, actualizar, eliminar, etc. Si se quiere realizar una función sobre un modelo que no este disponible en los repositorios, se puede crear un `CustomRepository` como se describe en la siguiente [documentación](https://typeorm.io/#/custom-repository)
