
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
	docker rmi outbreakinfo_bjorn -f
	docker rmi outbreakinfo_es -f
	docker rmi outbreakinfo_ingest -f
	docker rmi outbreakinfo_tornado -f
	docker rmi outbreakinfo_localbuild -f
	docker-compose rm -f bjorn
	docker-compose rm -f es
	docker-compose rm -f tornado
	docker-compose rm -f ingest
	docker-compose rm -f localbuild

#runs bjorn only to create new data
run-new-data:
	docker-compose --profile new-data up --build

#ingests new data and then brings up the web service
run-local-build-and-ingest:
	docker-compose --profile ingest-data up --build

#only brings up the es instace, tornado instance, and local build for website viewing
run-local-build:
	docker-compose --profile website up --build

#build all services
build-all:
	docker-compose --profile all build

#run all services, including bjorn
run-all:
	docker-compose up
