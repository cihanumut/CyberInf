pipeline {
    agent any

    environment {
        // Docker Hub kullanıcı adınızı buraya yazın veya Jenkins üzerinden ortam değişkeni olarak tanımlayın
        DOCKER_HUB_USER = 'kullanici_adiniz'
        IMAGE_NAME = 'cyberinf-backend'
        DOCKER_COMPOSE = 'docker compose'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Image') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest ./backend"
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh "docker run --rm ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest npm test"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing image to Docker Hub...'
                // Jenkins üzerinde 'docker-hub-credentials' ID'si ile bir 'Username with password' credential oluşturmalısınız.
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    sh "echo ${DOCKER_HUB_PASSWORD} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin"
                    sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up local images...'
                sh "docker rmi ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
            }
        }
    }

    post {
        success {
            echo 'Pipeline successfully pushed to Docker Hub!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}
