# Makefile for outbreak.info local build
#rework this to use profiles 

#removes all prior images
clean:
	docker rmi outbreakinfo_es -f
	docker rmi outbreakinfo_ingest -f
	docker rmi outbreakinfo_tornado -f
	docker rmi outbreakinfo_localbuild -f

#runs all docker services in the compose file including es db creation
run-local-build-and-ingest:
	docker-compose start es
	docker-compose start ingest
	docker-compose start tornado
	docker-compose start localbuild

#only brings up the es instace, tornado instance, and local build
run-local-build:
	docker-compose start es
	docker-compose start tornado
	docker-compose start localbuild

#run all services, including bjorn
run-all:
	docker-compose up
