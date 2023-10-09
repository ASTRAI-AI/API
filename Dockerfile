# syntax = docker/dockerfile:1

# Selecciona la versión de Node.js que deseas utilizar
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-slim as base

# Etiqueta para identificar el entorno de ejecución de flyctl
LABEL fly_launch_runtime="Node.js"

# Directorio de trabajo para la aplicación Node.js
WORKDIR /app

# Establece el entorno de producción
ENV NODE_ENV="production"

# Etapa de construcción para reducir el tamaño de la imagen final
FROM base as build

# Instala las dependencias necesarias para compilar módulos de Node.js
RUN apt-get update -qq && \
    apt-get install -y build-essential

# Instala las dependencias de desarrollo, incluyendo nodemon
COPY package.json package-lock.json ./
RUN npm ci --only=development

# Copia el código de la aplicación
COPY . .

# Etapa final para la imagen de la aplicación
FROM base

# Copia la aplicación construida, incluyendo las dependencias de producción
COPY --from=build /app /app

# Expone el puerto en el que la aplicación escucha (ajústalo según tu configuración)
EXPOSE 3000

# Comando para iniciar la aplicación con nodemon
CMD [ "npx", "nodemon", "dist/index.js" ]
