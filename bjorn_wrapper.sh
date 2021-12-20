#!/bin/bash
snakemake -s /bjorn/bjorn.smk --cores PARAM --scheduler greedy all
