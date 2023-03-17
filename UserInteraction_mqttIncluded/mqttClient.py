
import paho.mqtt.client as mqtt
import re
import time
import sys


# Define the MQTT Server (Broker) information
mqttBroker="localhost"
mqttPort=1883
# Connect to the MQTT Broker
mqttClient= mqtt.Client("signLanguage")
# mqttClient.username_pw_set("","")
mqttClient.connect(mqttBroker,mqttPort)
# Start an independent process (thread) for the MQTT handling such that the main program
# does not get impacted by delays while sending over the network
mqttClient.loop_start()
# Store the reliability information about the different characters within an interval in a dictionary.
# In this case, if an A was received twice with a probability of 75%, most_likely_dictionary{'A'}=1.5
most_likely_dictionary={}
# Store the current time such that we can send the first information after 300ms
last_output=time.time()

# In an endless loop, we read from the standard input and publish to the MQTT server
while(True):
    # We first read one line from standard input, i.e. the output of the previous program
    current_input= sys.stdin.readline().strip()

    # What we'll get for the detection looks like this:
    # 861 Sliding Two Fingers Up
    # 863 No gesture
    # We check whether the line starts with imagenet

    #current_input=re.sub("^\d+ ", "", current_input)

    # If there is no gesture, then don't interpret gesture
    if current_input == "2" or not re.match("\d", current_input):
        continue

    # Let's output this information
    #print("Current information: {}".format(current_input))
    if current_input in most_likely_dictionary:
        most_likely_dictionary[current_input]+=1
    else:
        most_likely_dictionary[current_input]=1
    
    current_output=time.time()
    # In case 300ms have passed...
    if current_output-last_output > 0.8:
        last_output=current_output
        # We loop through the dictionary in order to find the entry with the highest value,
        # i.e. the most likely detected class within the last interval
        most_likely="!"
        most_likely_percentage = 0
        for i in most_likely_dictionary:
            if most_likely_dictionary[i] >  most_likely_percentage:
                most_likely=i
                most_likely_percentage=most_likely_dictionary[i]
        # The most likely gesture gets published to MQTT under the topic jetson/sign_language
        print("Publishing to MQTT: {}".format(most_likely))
        mqttClient.publish("gesture",most_likely)
        # if most_likely=="Thumb Up":
        #     mqttClient.publish("gesture","[0.2, 0, 0]")
        # if most_likely=="Zooming In With Two Fingers":
        #     mqttClient.publish("jetson/xyz","[0.8, 0, 0]")
        # if most_likely=="Shaking Hand":
        #     mqttClient.publish("jetson/xyz","[0, 0.2, 0]")
        # if most_likely=="Stop Sign":
        #     mqttClient.publish("jetson/xyz","[0, 0.8, 0]")
        # Finally, we are clearing the dictionary's information 
        most_likely_dictionary={}
