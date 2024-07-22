# node:20 is the base image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code
COPY . .

# generate prisma client
RUN npx prisma generate

# Prisma migration
# RUN npx prisma migrate dev --name init

# Expose port and start application

EXPOSE 5000

CMD npm run dev
