
//Populating LGAs by State
var lgasbystate = {
    Adamawa: [" ","Hong", "Maiha", "Michika", "Mubi North", "Mubi South",],
    Borno: [" ","Bama", "Gwoza", "Jere", "Konduga", "Mafa","Maiduguri","Mobbar", "Monguno", "Ngala",],
    Yobe: [" ", ]
}

function changecat(value) {
        if (value.length == 0) document.getElementById("lga_scope").innerHTML = "<option></option>";
        else {
            var catOptions = "";
            for (categoryId in lgasbystate[value]) {
                catOptions += "<option>" + lgasbystate[value][categoryId] + "</option>";
            }
            document.getElementById("lga_scope").innerHTML = catOptions;
        }
}
