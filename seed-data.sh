#!/bin/bash

# Seed the iSpindel API with 25 random data points
echo "Seeding API with 25 data points..."

for i in {1..25}
do
  # Generate random gravity between 1.000 and 1.100 (declining trend)
  GRAVITY=$(awk -v i=$i 'BEGIN{srand(); printf "%.3f\n", 1.080 - (i * 0.003) + (rand() * 0.005)}')

  # Generate random angle between 25 and 75
  ANGLE=$(awk 'BEGIN{srand(); print int(25+rand()*50)}')

  # Generate temperature with slight variation (starting at 68°F, rising slightly)
  TEMP=$(awk -v i=$i 'BEGIN{srand(); printf "%.1f\n", 68 + (i * 0.1) + (rand() * 2 - 1)}')

  # Generate battery with declining trend (starting at 4.1V, declining to ~3.6V)
  BATTERY=$(awk -v i=$i 'BEGIN{srand(); printf "%.2f\n", 4.1 - (i * 0.02) + (rand() * 0.05)}')

  echo "[$i/25] Gravity: $GRAVITY | Temp: $TEMP F | Battery: ${BATTERY}V"
  
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
      \"RSSI\": -65
    }" > /dev/null
  
  # Small delay between requests
  sleep 0.5
done

echo ""
echo "✅ Done! Sent 25 data points to http://localhost:5001/"
echo "Check your browser to see the chart!"

