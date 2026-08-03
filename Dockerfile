FROM node:20-slim

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source and frontend (server.js serves frontend as static files)
COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/backend

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
