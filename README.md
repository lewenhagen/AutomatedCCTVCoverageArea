# Automated Generation of CCTV Camera Coverage Areas

# Installation

* Clone the project and step into directory.
* Run `$ npm install` to install the needed packages.
* Add camera positions to `data/cams.json` or add your own file. Default is some random coordinates in Malmoe.
* Add your desired geojson file. Default is Malmoe, Sweden.
  * Downloaded as geojson from [https://overpass-turbo.eu/](https://overpass-turbo.eu/).
  ```  code [out:json];
       area[name="Malmö"]->.a;
       way["building"](area.a);
       out geom;
  ``` 
* Run the script "generate.js" with `$ node generate.js data/<your_cam_file>.json`.
* View the result by running `$ npm run http-server` and view the result in your browser at "localhost:9001". It opens the file `data/result.geojson` for viewing.

### Link to paper

Feel free to cite the paper:
TBD

### Acknowledgment

Special thanks to Volodymyr Agafonkin for creating RBush which helped a lot (https://github.com/mourner/rbush/blob/master/README.md).
