
#Makefile for outbreak.info local build.

#Option are as follows:
#1. clean will remove all images, including the es instance
#2. run-new-data will create a new metadata.json file by runnning
#the bjorn pipeline on whatever repository is specified in the
#config file
#3. run-local-build-and-ingest will first take a metadata.json file,
#ingest it into and elastic search database, and then bring up the api
#and the website
#4. run-local-build will bring up the api and the website
#5. run-all will create a metadata.json by running bjorn, ingest the data
#into an elastic search database, and then bring up the api and the website 

#removes all prior images
clean:
	docker rmi andersenlabapps/outbreak-info-website -f
	docker rmi andersenlabapps/outbreak-info-bjorn -f
	docker rmi andersenlabapps/outbreak-info-tornado -f
	docker rmi andersenlabapps/outbreak-info-es -f
	docker rmi andersenlabapps/outbreak-info-ingest -f
	docker container prune -f
	sudo docker volume rm outbreakinfo_data01
	sudo docker volume rm outbreakinfo_data02
	
build-new-data:
	docker-compose --profile new-data up --build

run-new-data:
	docker-compose --profile new-data up

build-single-node:
	docker-compose --profile single-node up --build

run-single-node:
	docker-compose --profile single-node up

build-ingest:
	docker-compose --profile ingest-data up --build

run-ingest:
	docker-compose --profile ingest-data up

run-ingest-only:
	docker-compose --profile ingest-only up

build-website:
	docker-compose --profile website up --build

run-website:
	docker-compose --profile website up

build-all:
	docker-compose --profile all --build

run-all:
	docker-compose --profile all up
