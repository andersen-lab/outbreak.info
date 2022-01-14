#!/bin/bash
PARAM=$(jq .cores ./localConfig.json)
echo $PARAM
snakemake -s ./bjorn.smk --cores $PARAM --scheduler greedy --verbose  --use-singularity all
