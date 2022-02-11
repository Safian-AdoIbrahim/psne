
//Populating LGAs by State
var lgasbystate = {
    Adamawa: [" ","Demsa", "Fufore", "Ganye", "Gireri", "Gombi", "Guyuk", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo-Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
    Borno: [" ","Abadam", "Askira-Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala-Balge", "Konduga", "Kukawa", "KwayaKusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
    Yobe: [" ", "Bade", "Borsari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Karawa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmua", "Yunusari", "Yusufari"]
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
