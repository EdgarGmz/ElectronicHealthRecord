## Deploy API en AWS Lambda (Express + serverless-http)

Este backend (`api`) ya incluye un handler para AWS Lambda en `src/lambda.ts` usando `serverless-http`.

### Build

Desde `api/`:

```bash
npm install
npm run build
```

Eso genera `dist/lambda.js` y el handler exportado como `dist/lambda.handler`.

### Deploy con AWS SAM (recomendado)

Se incluye `template.yaml` en `api/`.

Requisitos:
- AWS CLI configurado
- AWS SAM CLI

Comandos:

```bash
sam build
sam deploy --guided
```

#### Variables de entorno

En Lambda debes configurar las mismas variables que usas en `.env` (DB, JWT, etc.).  
SAM las puede inyectar desde `template.yaml` o durante `sam deploy`.

### Notas (Prisma)

- El handler llama `prisma.$connect()` y configura `context.callbackWaitsForEmptyEventLoop = false` para reutilizar el contenedor entre invocaciones.
- En producción se recomienda usar RDS Proxy o Prisma Accelerate si el tráfico es alto.

