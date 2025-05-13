#!/bin/bash

# Check if a mission ID is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <MISSION_ID>"
    exit 1
fi

# Assign the mission ID from the first argument
MISSION_ID_START=$1
MISSION_ID_END=$2

OUTPUT_DIR="missions"
# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"
# Check if a range of mission IDs is provided
if [[ "$MISSION_ID_START" =~ ^[0-9]+$ && "$MISSION_ID_END" =~ ^[0-9]+$ ]]; then
    # Loop through the range and fetch each mission
    for (( ID=MISSION_ID_START; ID<=MISSION_ID_END; ID++ )); do
        URL="https://www.leitstellenspiel.de/einsaetze/${ID}"
        OUTPUT_FILE="${OUTPUT_DIR}/${ID}.html"

        # Fetch the content using curl
        echo "Fetching mission ${ID}..."
        curl -s -o "$OUTPUT_FILE" "$URL"

        # Check if the file was successfully downloaded
        if [ $? -eq 0 ]; then
            echo "Mission ${ID} content saved to ${OUTPUT_FILE}"
        else
            echo "Failed to fetch the mission content from ${URL}"
        fi
    done
fi