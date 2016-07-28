if (!arguments[0]) {
    print('usage:\n $ jsc script.js -- "`cat file.pan`"');
    quit();
}

var importPAN = function (paloAltoNetworkContent) {

  paloAltoNetworkContent = paloAltoNetworkContent.replace(/\[\s+/gi, '[');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/\s+\]/gi, ']');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/[ |\t]+/gi, ' ');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/([a-zA-Z0-9-./]+) ([\[\]a-zA-Z0-9-./ ]+);/gi, '"$1": "$2",');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/"\[(.*)\]"/gi, '[$1]');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/, }/gi, ' }');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/([a-zA-Z0-9-.]+) \{/gi, '"$1": {');
  var lines = paloAltoNetworkContent.match(/[^\r\n]+/g);
  for (var i = 0, length = lines.length; i < length; i++) {
   matches = lines[i].match(/\[([^\]]+)\]/)
   if (matches && matches.length > 1) {
     var s = "[" + matches[1].split(" ").map(function(e) {return '"' + e + '"'}).join(", ") + "]";
     paloAltoNetworkContent = paloAltoNetworkContent.replace(`[${matches[1]}]`, s);
   }
  }
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/\s+/gi, ' ');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/\}/gi, '},');
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/, \}/gi, ' }');
  paloAltoNetworkContent = "{" + paloAltoNetworkContent + "}";
  paloAltoNetworkContent = paloAltoNetworkContent.replace(/\},\s?\}/gi, '} }');

  print(paloAltoNetworkContent);
}

importPAN(arguments[0]);
