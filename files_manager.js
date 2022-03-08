const fs = require('fs');



// base64 to buffer
// function base64ToBufferAsync(base64) {
//     var dataUrl = "data:application/octet-binary;base64," + base64;
  
//     fetch(dataUrl)
//       .then(res => res.arrayBuffer())
//       .then(buffer => {
//         console.log("base64 to buffer: " + new Uint8Array(buffer));
//     })
// }


function saveBase64CoverLocal(filename, image_base64, image_extension){

    const main_url = "http://localhost:4050/images";
    const cover_folder = "./images";
    let destination_path = cover_folder + "/" + filename + "." + image_extension;

    let image_buffer = new Buffer.from(image_base64, 'base64');
    fs.createWriteStream(destination_path).write(image_buffer);

    return main_url + "/" + filename + "." + image_extension;

}


exports.saveBase64CoverLocal = saveBase64CoverLocal;