# Variables de Entorno

Se usan para encapsular configuraciones de acuerdo a los diferentes ambientes de desarrollo.

### Uso de variables

#### App configuration

- **PORT**: Puerto sobre el que corre node.
- **SHORT_NAME**: Nombre corto de la aplicación _(En minúsculas)_. Ejemplo: `bc`, `tg`, `vk`, `tb`.
- **NAME**: Nombre de la aplicación. Ejemplo: `Bericool`, `Tugo`, `Vanguardia Kids`, `Tu Boleta`.
- **MULTIPLE_LOGIN**: Si el API permitirá login en múltiples dispositivos, es decir, si un usuario va a almacenar muchos auth tokens. Ejemplo: Caja Alianza al ser un app bancaria solo permite sesión en un dispositivo, para ese caso se manejaría con `false`. Bazzaio al ser un e-commerce permite que el usuario tenga su sesión activa en diferentes dispositivos, para ese caso se manejaría con `true`.
- **HTTPS**: Si el API corre con certificados `SSL`. Para este caso se maneja con `true`o `false`. En caso de ser `true`, los archivos de certificado _(key y crt)_ deben nombrarse con el **NAME** en minúsculas, con `kebab-case` y deben estar ubicados en `/etc/ssl/`.

#### Database Configuration

- **DB_USER**
- **DB_PASSWORD**
- **DB_DATABASE**
- **DB_HOST**
- **DB_PORT**

#### Jwt configuration

- **JWT_SECRET**: Llave secreta para usar los JWT. Esta llave la pueden generar [aquí](https://randomkeygen.com/).

#### MAIL CONF

Normalmente se usa para el ambiente en desarrollo [Ethereal](http://ethereal.email/)

- **MAIL_HOST**
- **MAIL_PORT**
- **MAIL_SECURE**: Identifica si el correo debe ir encriptado o no. `true`o `false`.
- **MAIL_USER**
- **MAIL_PASSWORD**

#### AWS config

- **AWS_ACCESS_KEY_ID**
- **AWS_SECRET_ACCESS_KEY**
- **AWS_REGION**
- **AWS_SMS_TYPE**
- **AWS_VERSION**
- **AWS_DEFAULT_PHONE_NUMBER**: El número por defecto para enviar un mensaje cuando no se especifique nada en el servicio de enviar código de verificación por SMS. Ejemplo: `+571234567`.

#### AWS FILES

- **AWS_BUCKET**: El bucket de AWS donde se guardarán todos los archivos
- **AWS_USER_FOLDER**: Este es un ejemplo de cómo se deben manejar los folders de AWS para subir imágenes, aquí pueden agregar la ruta `users`, `users/backgronds`, `franchises`, etc.

---

## Env Example

Contiene todas las variables de desarrollo necesarias.

## Env Development

Es el entorno de desarrollo, es decir, el trabajo local. Este archivo no se sube a git puesto que cada desarrollador en su local suele usar diferentes datos para correr el proyecto.

## Env Staging

Es el entorno usado para pre-producción, debe contener la configuración necesaria para el buen funcionamiento sobre el servidor de pruebas Kubo (Phortos).

## Env Production

Es el entorno usado para producción.
