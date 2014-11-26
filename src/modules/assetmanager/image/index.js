/*
 *
 * Google Ad Prototype 2014 - Image Asset Definition
 * @author: Joe Harlow
 *
 */

/*
 *  arrayBufferToBase64 [private] - Convert Array Buffer to Base64 encode.
 *  @param {arrayBuffer} - The files array buffer.
 *
 *  @return {string} - The Base64 encoded image.
 */
function arrayBufferToBase64(arrayBuffer) {
      var base64    = '';
      var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
     
      var bytes         = new Uint8Array(arrayBuffer);
      var byteLength    = bytes.byteLength;
      var byteRemainder = byteLength % 3;
      var mainLength    = byteLength - byteRemainder;
     
      var a, b, c, d;
      var chunk;
     
      // Main loop deals with bytes in chunks of 3
      for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
         
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63;               // 63       = 2^6 - 1
         
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
      }
     
      // Deal with the remaining bytes and padding
      if (byteRemainder == 1) {
            chunk = bytes[mainLength];
         
            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
         
            // Set the 4 least significant bits to zero
            b = (chunk & 3)   << 4; // 3   = 2^2 - 1
         
            base64 += encodings[a] + encodings[b] + '==';
      } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
         
            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4
         
            // Set the 2 least significant bits to zero
            c = (chunk & 15)    <<  2; // 15    = 2^4 - 1
         
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
      }
      
      return base64;
}

/*
 *  ImageAsset - Buffer Loader transformation function.
 *  @param {src} - File URL.
 *  @param {res} - XHR ArrayBuffer response.
 *  @param {next} - Function to carry on the Buffer Loader after transformation.
 */
var ImageAsset = function(src, res, next) {

    var buffer, isLoaded = false;
    var ret = {
        uri: function() {
            return src;
        },
        source: src
    };

    if (res && next) {
        var filetype = /\.(\w+)$/.exec(src)[1];
        buffer = 'data:image/' + filetype + ';base64,' + arrayBufferToBase64(res);
        ret.uri = function() {
            return buffer;
        };
        isLoaded = true;
        next(ret);
    } else {
        return ret;
    }

};

module.exports = ImageAsset;