FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN cd backend && npm install
RUN cd frontend && npm install

COPY . .

RUN cd backend && npm run build
RUN cd frontend && npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/package*.json ./frontend/

COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY Cargo.toml ./Cargo.toml
COPY contracts ./contracts
COPY database ./database
COPY docs ./docs
COPY .env.example ./

WORKDIR /app/backend

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3001/api/v1/health || exit 1

CMD ["npm", "run", "start"]