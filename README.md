# Geodesignhub Asset and Investment Analysis
This is small plugin to help undertake cash flow and asset analysis on diagrams in Geodesignhub. It uses the Geodesign Hub [API](http://www.geodesignhub.com/api/) to download the diagram and systems data and then provides a series of controls to analyze potential uses of this asset. 

## Analyze how investments flow in a design over time and space 
This plugin downloads a design using the [Geodesignhub API](https://www.geodesignhub.com/api/), computes its area and construction costs and provides a [Discounted Cash Flow](https://en.wikipedia.org/wiki/Discounted_cash_flow) analysis to calculate Net Present Value of the different components of the design

![alt text][logo]
![alt text][logo2]
![alt text][logo3]

[logo]: https://i.imgur.com/npgPPTm.jpg "Geodesign Hub Diagram Discounted Cash Flow"
[logo2]: https://i.imgur.com/E82qisZ.jpg "Geodesign Hub Diagram Discounted Cash Flow"
[logo3]: https://i.imgur.com/gZDFCV9.jpg "Geodesign Hub Diagram Discounted Cash Flow"



### Spatial Analysis Library
In additon to computing the basic financial analysis (Discounted Cash Flow), a spatial anlaysis library is included in this plugin. The library analyzes the location of the diagram and then generates a grid. Once the grid is generated, it allocates the costs and income over that grid. This is useful to visualize how money flows in the design over time and space. 

### Adding the plugin
The plugin can be added to your project using the Administration panel. 

## Screenshots
You can adjust the WACC to different settings for a new NPV and cash flow analysis. Generally a value between 5-15 is recommended. Consult a professional to estimate the range. 

![interface][ui]

![interface][ui2]

[ui0]: https://i.imgur.com/vRyxhr6.jpg "User Interface" 

[ui1]: https://i.imgur.com/Zdf0XVG.jpg "Yearly Interface" 

[ui2]: https://i.imgur.com/3zVDFGF.jpg "Boundary Interface" 

[ui]: https://i.imgur.com/ERVGb6z.png "User Interface"


Once the WACC and the NPV has been calculated, maps are generated that show how the investemnts are distributed in the study area. The Spatial Analysis library distributes the investments over a grid. 

![Set WACC and Compute][waccandslider]

[waccandslider]: https://i.imgur.com/jkNliPI.png "Design Discounted Cash Flow Analysis"

In addition to showing the total investment, you can choose to see yearly investments and use the slider to see how over the years, your investment will be distributed. 

![alt text][yearlyortotal]

![interface][ui0]

![interface][ui1]

While the defualt is to show the Cash flow analysis for every system, you can choose to see just specific systems e.g. Transport and Housing and so on. 

![alt text][filterbysystem]

[filterbysystem]: https://i.imgur.com/T5ccYlb.png "Design Discounted Cash Flow Analysis"

You can select the "Raw" numbers to get the actual number instead of abbreviated on and then directly use it in Excel. Changing the Raw / Pretty Print button will update the tables and the values. 

![alt text][finstatement]

[finstatement]: https://i.imgur.com/U86wL3n.jpg "Design Discounted Cash Flow Analysis"


