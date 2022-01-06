# About outbreak.info Local Build
Outbreak.info local build is a spin-off project of [outbreak.info](https://outbreak.info/) from Scripps Research that encourages users to launch their own genomic analysis platforms using custom data sets. It allows users to take their own sequencing data and metadata, and build an individual database, server, and website with similar functionality to the "Variants" arm of [outbreak.info](https://outbreak.info/) with only a configuration file and several terminal commands.  

## How it works


# About outbreak.info
During outbreaks of emerging diseases such as COVID-19, efficiently collecting, sharing, and integrating data is critical to scientific research.

outbreak.info is a standardized, searchable platform to discover and explore COVID-19 and SARS-CoV-2 data from the [Center for Viral Systems Biology](http://cvisb.org/) at Scripps Research. It contains three parts: a standardized searchable database of COVID-19 research; customizable real-time surveillance reports on SARS-CoV-2 variants and mutations; and an explorable interface to examine changes in epidemiological data.

*Disclaimer: This project is a work-in progress. Please submit an [issue](https://github.com/SuLab/outbreak.info/issues) if you notice any bugs or want to suggest features.*


# Deploying
Several things are required for deployment.
 
1. Clone the repository.
   a. Make sure the submodules bjorn and outbreak-lite-api are populated.
2. Make sure Docker and Docker-Compose are installed.
3. Modify the configuration file [localConfig.json](https://github.com/andersen-lab/outbreak.info/blob/county_info/web/src/localConfig.json)
   a. Description of each of these parameters can be found [here]()  
4. Choose from the Makefile commands.
   a. `make run-website` will bring up the tornado server, elastic search database, and website
	
# Data Formating 

