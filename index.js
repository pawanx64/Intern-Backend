    const express = require("express");
    const crypto = require("crypto");

    const app = express();
    const PORT = 3000;



    function generateRandomIP() {
    return Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 256)
    ).join(".");
    }

    function identifyNode(ip, selectedNode) {
    console.log(`Incoming IP: ${ip} → Routed to: ${selectedNode}`);
    }

    let nodes = ["Node-A", "Node-B", "Node-C"];

    let nodeHealth = {
    "Node-A": true,
    "Node-B": true,
    "Node-C": true
    };

    function hashValue(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
    }

    function LoadBalancer(ip) {
    const healthyNodes = nodes.filter(node => nodeHealth[node]);

    if (healthyNodes.length === 0) {
        console.log("No healthy nodes available");
        return null;
    }

    const ipHash = hashValue(ip);

    let selectedNode = healthyNodes[0];
    let minDifference = Infinity;

    healthyNodes.forEach(node => {
        const nodeHash = hashValue(node);
        const diff = Math.abs(
        parseInt(ipHash.slice(0, 8), 16) -
        parseInt(nodeHash.slice(0, 8), 16)
        );

        if (diff < minDifference) {
        minDifference = diff;
        selectedNode = node;
        }
    });

    identifyNode(ip, selectedNode);

    return selectedNode;
    }


    function simulateTraffic(requestCount = 5) {
    for (let i = 0; i < requestCount; i++) {
        const ip = generateRandomIP();
        LoadBalancer(ip);
    }
    }

    simulateTraffic(10);


    app.get("/route", (req, res) => {
    const ip = req.ip || generateRandomIP();
    const node = LoadBalancer(ip);

    res.json({
        ip,
        routedTo: node
    });
    });

    app.get("/health/:node/:status", (req, res) => {
    const { node, status } = req.params;
    nodeHealth[node] = status === "up";
    res.json({ node, status: nodeHealth[node] });
    });

    app.listen(PORT, () => {
    console.log(`🚀 Load Balancer running on port ${PORT}`);
    });
