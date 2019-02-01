# Geodesignhub Asset and Investment Analysis
This plugin has two parts: Asset Analysis and Investment Visualization. It uses the Geodesign Hub [API](http://www.geodesignhub.com/api/) to download the diagram and systems data and then provides a series of controls to analyze and set potential uses of this asset. 

![alt text][logo]

![alt text][logo4]

![alt text][logo5]

![alt text][logo2]

![alt text][logo3]

[logo]: https://i.imgur.com/npgPPTm.jpg "Geodesign Hub Diagram Discounted Cash Flow"
[logo2]: https://i.imgur.com/E82qisZ.jpg "Geodesign Hub Diagram Discounted Cash Flow"
[logo4]: https://i.imgur.com/GRx4gYx.jpg "Geodesign Hub Diagram Discounted Cash Flow"
[logo3]: https://i.imgur.com/gZDFCV9.jpg "Geodesign Hub Diagram Discounted Cash Flow"
[logo5]: https://i.imgur.com/2dHdhIK.jpg "Geodesign Hub Diagram Discounted Cash Flow"
    

### Investment Analysis Library
This plugin downloads data from Geodesignhub using the [Geodesignhub API](https://www.geodesignhub.com/api/). In additon to helping with  the basic financial analysis demonstrted above, a spatial anlaysis library is included in this plugin. The library analyzes the location of the diagram over the boundary uploaded into Geodesignhub. A boundary is a simple polygon file that can be really any boundary: social, political, economic or administrative. Once the boundary is uploaded, the plugin computes the asset details over that boundary. This is useful to visualize how money flows in the design over time and space. 

## Results 
Investment over time per boundary
![interface][ui0]
Chorpleth intensity map of investments demonstrating the across various boundaries. 
![interface][ui4]

All the asset details "rolled up" in one list
![interface][ui2]
Split the allocations across different boundaries so you can see how the distribution of jobs, visitors, population and services are split across the different boundaries. 
![interface][ui1]
![interface][ui3]


[ui0]: https://i.imgur.com/FgoqKbM.jpg "Boundaries chart" 

[ui1]: https://i.imgur.com/RznTWoh.jpg "Population and Jobs" 
[ui2]: https://i.imgur.com/SYE7z3q.jpg "Rollup" 
[ui3]: https://i.imgur.com/3kI6ioU.jpg "Yearly Interface" 
[ui4]: https://i.imgur.com/51dzMca.jpg "Boundary map" 

### Adding the plugin
The plugin can be added to your project using the Administration panel. 
