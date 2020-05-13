import pandas as pandas
import numpy as np
import json


def drawCircularBiPlot(chart_type, type_to_display):
	print("We're in")
	print(chart_type, type_to_display)


def fetch_data(chart_type, type_to_display):
	'''
	This method is the driver function to fetch data for any specific chart type for any data. 
	
	Input:
		chart_type:
			A string keyword which mentions the type of chart to be displayed and therefore allows us to know 
			which method to call to retrieve appropriate data.
		type_to_display: 
			type_to_display - A string keyword that is used to specify what kind of data is to be 
			displayed in the graph. 
			Values could be 'CONSOLIDATED' or the name of the genre.
	Output:
		If 'type_to_display' is CONSOLIDATED, we send the aggregated budget/revenue across all
		available genres.
		If 'type_to_display' is the name of the genre, we send the [1-10, 45-55, 90-100] ranged 
		values in revenue/budget sorted list. 
	''' 
	method_mapper_dict = {"circular_biplot": "drawCircularBiPlot(chart_type, type_to_display)", "scatterplot": "drawScatterPlot(chart_type, type_to_display)",
							"barplot": "drawBarPlot(chart_type, type_to_display)"
							}
	method_name = method_mapper_dict[chart_type] 
	data = eval(method_name)

	return data;