pipeline {
    agent any

    tools {
        nodejs 'Node'
    }

    environment {
        CI = 'true'
        REPO = 'https://github.com/24211a6792-PuneetKumarSoni/Online-Learning-Portal-devops.git'
    }

    stages {

        stage('Checkout Backend') {
            steps {
                echo 'Checking out backend branch...'

                dir('pathshala-backend') {
                    git branch: 'Revan(Backend)',
                        url: "${REPO}"
                }
            }
        }

        stage('Environment Check') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'git --version'
            }
        }

        stage('Backend Install') {
            steps {
                dir('pathshala-backend/pathshala-backend') {
                    echo 'Installing backend dependencies...'
                    bat 'dir'
                    bat 'npm install'
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('pathshala-backend/pathshala-backend') {
                    echo 'Running backend tests...'
                    bat 'npm test'
                }
            }
        }
    }

    post {
        success {
            echo '======================================'
            echo '       JENKINS BUILD SUCCESSFUL'
            echo '======================================'
        }

        failure {
            echo '======================================'
            echo '         JENKINS BUILD FAILED'
            echo '======================================'
        }

        always {
            echo 'Pipeline finished.'
        }
    }
}
