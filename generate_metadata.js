var fs = require('fs');

for (var i = 0; i < 100; i++) {
	var json = {}
	json.name = "LiquidNFT #" + i;
	json.description = "First fractioned NFT collection, invest a cent and own your share!";
	json.image = "ipfs:///" + i + ".png";

	fs.writeFileSync('' + i, JSON.stringify(json));
}
