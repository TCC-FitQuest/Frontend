# Frontend

App FitQuest feito com Expo, React Native, TypeScript, NativeWind, Zustand e React Navigation.

## Principais pastas

- `src/screens/`: telas do app.
- `src/navigation/`: navegação.
- `src/service/`: clientes HTTP e integrações com a API.
- `src/store/`: stores Zustand.
- `src/components/`: componentes reutilizáveis.
- `src/theme/`: tema visual.
- `src/models/`: tipos e modelos usados pelo app.

## Variáveis de ambiente

Crie o arquivo local a partir do exemplo:

```bash
cp .env.example .env
```

Variável principal:

- `EXPO_PUBLIC_API_URL`: URL base do backend.

Exemplos:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_URL=http://192.168.1.50:8000
```

Use o IP da sua máquina na rede quando testar em um celular físico via Expo Go.

## Rodando localmente

```bash
npm ci
npm start
```

Outros comandos:

```bash
npm run web
npm run android
npm run ios
npm run typecheck
```

## Rodando com Docker

Pela raiz do projeto:

```bash
docker compose up --build frontend backend db
```

O Expo web fica em `http://localhost:8081`.

No Compose, a variável padrão é:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Para testar em celular físico, ajuste essa variável no `.env` da raiz para o IP da sua máquina.

## Build da imagem

```bash
docker build -t fitquest-frontend .
docker run --rm -p 8081:8081 -e EXPO_PUBLIC_API_URL=http://localhost:8000 fitquest-frontend
```

## CI/CD

A workflow do frontend está em `.github/workflows/frontend-ci-cd.yml`.

Ela executa:

- `npm ci`;
- `npm run typecheck`;
- build da imagem `Frontend/Dockerfile`;
- publicação no GHCR em push para `main` ou `master`.
