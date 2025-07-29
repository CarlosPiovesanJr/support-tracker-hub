# Estágio 1: Build da aplicação
FROM node:18-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci --no-audit --no-fund

# Copiar código fonte
COPY . .

# Fazer build da aplicação
RUN npm run build

# Estágio 2: Servidor nginx
FROM nginx:alpine

# Copiar arquivos da build para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Criar diretório de logs
RUN mkdir -p /var/log/nginx

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]