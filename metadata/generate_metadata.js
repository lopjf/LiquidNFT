var fs = require('fs');

for (var i = 0; i < 100; i++) {
	var json = {}
	json.name = "Token #" + i;
	json.description = "First fractioned NFT collection, invest a cent and own your share!";
	json.image = "ipfs://bafybeif62stminn3w6brhjamkykbn24vxs3sasr3sxv5uqtthsp45v56je/" + i + ".png";

	fs.writeFileSync('' + i, JSON.stringify(json));
}