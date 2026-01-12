#!/bin/bash

# Seed the iSpindel API with data points over 45 days
# Generate one data point every 6 hours = 4 points per day = 180 points total
TOTAL_POINTS=180
DAYS=45
INTERVAL_HOURS=6

echo "Seeding API with $TOTAL_POINTS data points over $DAYS days..."

# Calculate 45 days ago in seconds
DAYS_AGO_SECONDS=$((DAYS * 24 * 60 * 60))
START_TIME=$(($(date +%s) - DAYS_AGO_SECONDS))

for i in $(seq 1 $TOTAL_POINTS)
do
  # Calculate timestamp for this data point (every 6 hours)
  POINT_OFFSET=$(((i - 1) * INTERVAL_HOURS * 60 * 60))
  TIMESTAMP=$((START_TIME + POINT_OFFSET))
  
  # Generate random gravity between 1.000 and 1.100 (declining trend over time)
  # First 2/3 of fermentation: rapid decline, last 1/3: slow decline
  if [ $i -lt 120 ]; then
    GRAVITY=$(awk -v i=$i 'BEGIN{srand(); printf "%.3f\n", 1.080 - (i * 0.0006) + (rand() * 0.002)}')
  else
    GRAVITY=$(awk -v i=$i 'BEGIN{srand(); printf "%.3f\n", 1.008 + (rand() * 0.002)}')
  fi
  
  # Generate random angle between 25 and 75
  ANGLE=$(awk 'BEGIN{srand(); print int(25+rand()*50)}')
  
  # Generate temperature with variation (68-72°F, slightly higher during active fermentation)
  if [ $i -lt 60 ]; then
    # Active fermentation - warmer
    TEMP=$(awk 'BEGIN{srand(); printf "%.1f\n", 70 + (rand() * 3)}')
  else
    # Post fermentation - cooler
    TEMP=$(awk 'BEGIN{srand(); printf "%.1f\n", 68 + (rand() * 2)}')
  fi
  
  # Generate battery with declining trend (starting at 4.2V, declining to ~3.5V over 45 days)
  BATTERY=$(awk -v i=$i -v total=$TOTAL_POINTS 'BEGIN{srand(); printf "%.2f\n", 4.2 - (i/total * 0.7) + (rand() * 0.05)}')
  
  # Format the timestamp for display
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    DATE_STR=$(date -r $TIMESTAMP "+%Y-%m-%d %H:%M")
  else
    # Linux
    DATE_STR=$(date -d @$TIMESTAMP "+%Y-%m-%d %H:%M")
  fi
  
  echo "[$i/$TOTAL_POINTS] $DATE_STR | Gravity: $GRAVITY | Temp: $TEMP F | Battery: ${BATTERY}V"
  
  # Send data with custom timestamp
  curl -s -X POST http://localhost:5001/ \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"iSpindel\",
      \"ID\": \"iSpindel001\",
      \"angle\": $ANGLE,
      \"temperature\": $TEMP,
      \"temp_units\": \"F\",
      \"battery\": $BATTERY,
      \"gravity\": $GRAVITY,
      \"interval\": 900,
      \"RSSI\": -65,
      \"timestamp\": $((TIMESTAMP * 1000))
    }" > /dev/null
  
  # Small delay to avoid overwhelming the server
  sleep 0.1
done

echo ""
echo "✅ Done! Sent $TOTAL_POINTS data points over $DAYS days to http://localhost:5001/"
echo "Data spans from $(date -r $START_TIME "+%Y-%m-%d") to $(date "+%Y-%m-%d")"
echo "Check your browser to see the chart!"

