# Asset and Investment Analysis Library
This plugin enables multi-scale geodesign This plugin has two parts: Asset Analysis and Investment Visualization. It uses the Geodesign Hub [API](http://www.geodesignhub.com/api/) to download the diagram and systems data and then provides a series of controls to analyze and set potential uses of this asset. 

### Asset Analysis Library
Using this library you can set specific characteristics of a diagram such as people housed, total units and number of floors for a example for a residential diagram, as shown below. 
![alt text][logo]

In addition you can set a representative image and compute targetted population density. There are other asset types as well such as Tourism, Office, Retail etc. As we progress, we will continue to add additional asset classes. 

![alt text][logo4]

![alt text][logo5]

Once you have set the housing requirements, you can then look at capital investment and a ROI on that investment. 

![alt text][logo2]

Finally you can then compute the services requried for that asset to understand the implications of putting a asset like that in the space.

![alt text][logo3]

[logo]: https://i.imgur.com/npgPPTm.jpg "Geodesignhub Diagram Discounted Cash Flow"
[logo2]: https://i.imgur.com/E82qisZ.jpg "Geodesignhub Diagram Discounted Cash Flow"
[logo4]: https://i.imgur.com/GRx4gYx.jpg "Geodesignhub Diagram Discounted Cash Flow"
[logo3]: https://i.imgur.com/gZDFCV9.jpg "Geodesignhub Diagram Discounted Cash Flow"
[logo5]: https://i.imgur.com/2dHdhIK.jpg "Geodesignhub Diagram Discounted Cash Flow"
    

### Investment Analysis Library
This is the second part of the software. Once you have set the asset details, you can then do very interesting analysis of the interventions. 

In additon to helping with  the basic financial analysis demonstrted above, a spatial anlaysis library is included in this plugin. The library analyzes the location of the diagram over the boundary uploaded into Geodesignhub. A boundary is a simple polygon file that can be really any boundary: social, political, economic or administrative. Once the boundary is uploaded, the plugin computes the asset details over that boundary. This is useful to visualize how money flows in the design over time and space. 

## Analysis 
Investment over time per boundary, once the capital investment is set, you can then compute how the investment flows over different boundaries. Below is a chorpleth intensity map of investments demonstrating the across various boundaries. 
![interface][ui4]
Also as a simple chart. 
![interface][ui0]

Once intervention strategy is finalized, all the asset details "rolled up" in one list with all the totals. 
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
