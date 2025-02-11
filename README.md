## Progression personnelle du TD
* 1.1 Spin up nodes

# simple-onion-router-network

Your goal for this exercise is to implement a version of the onion routing protocol we saw in module 5.

This repository already implements the basic structure you need for the onion routing network, your goal will be to implement the inner workings of the protocol.

Note that to simplify this implementation we won't be covering responses. This means that the network will only be used to send messages, i.e. requests shouldn't expect a response from the destination.

## The basic structure

This project has 3 components which represent the core components of the onion routing protocol:
- nodes
- users
- the nodes registry

### Nodes

They are onion routers which sole purpose is to route traffic from one node to the other, or one user to a node in the case of an entry node and from a node to a user in the case of an exit node.

### Users

They are users of the network. They can send and receive messages.

### The nodes registry

This entity holds a list of nodes, their IP addresses and their RSA public key. Any user can request this list and nodes can ask the registry to become part of this list.

## Setting up the project

You will first need to install the dependencies of the project by running `npm install` at the root of the project.

Note that the only required dependencies are already specified and no other package should be installed to complete this exercise.

Used packages are
- crypto (included with node)
- body-parser
- express

You should have Node installed at a version superior to v18.

## How to test your code

There are two ways to achieve this.

1. Run the unit tests with the command `npm run test` and see how your implementation performs against the given tests
2. Launch the network manually with `npm run start` and make http requests to nodes and users using tools like Postman or Insomnia

## Onion routing protocol

Follow the [step by step instructions](./instructions.md) to complete this workshop.

## Grading

You are graded out of 20 points based on the unit tests provided in the `__test__/tests/` directory. 

Note that not all tests are provided so you can secure a number of points but the rest will be graded after you submit the exercise.

This exercise should be completed individually, you are not allowed to reuse code from other students. Any detected instances of copied code will incur a reduction of your grade.

# 📝 Personal Remarks

## 🚀 Explanation: Spin Up Nodes

### 1️⃣ `simpleOnionRouter.ts`
This file defines how a single Onion Router (node) behaves. It is responsible for creating individual onion routing nodes that will later be used in the full network.

#### ✅ Creates an Express Server  
Each node runs as an independent server using **Express**, a lightweight HTTP framework, to handle network requests efficiently.

#### ✅ Listens on `BASE_ONION_ROUTER_PORT + nodeId`  
Each node must listen on a unique port to allow multiple nodes to run simultaneously.  

We compute the port dynamically using:
ts
'''const port = BASE_ONION_ROUTER_PORT + nodeId;'''

Example:
If BASE_ONION_ROUTER_PORT = 4000, then:
Node 0 runs on 4000.
Node 1 runs on 4001.
Node 2 runs on 4002.
This ensures no port conflicts and allows multiple nodes to coexist.

✅ Implements a /status route returning "live"  
The /status route allows us to check if the node is running.  
When we send a request like:  
bash  
'''
curl http://localhost:4001/status
'''  
We get:  
nginx  
'''
live
'''  
This helps with debugging to ensure nodes are operational.

✅ Starts a server and returns it  
The function spins up an Express server and starts listening for connections.
Returning the server allows us to keep track of it (e.g., for stopping servers later if needed).

💡 Why is this important?  
This file provides the core functionality for how each router (node) operates in the Onion Routing network.


2️⃣ launchOnionRouters.ts  
This file creates multiple Onion Router nodes by calling simpleOnionRouter() multiple times.

✅ Loops through n nodes  
We need more than one node to simulate an Onion Routing network.  
Instead of manually starting each node, we use a loop:  
ts  
'''
for (let index = 0; index < n; index++) {
  simpleOnionRouter(index);
}
'''
If n = 3, this loop will:
Start simpleOnionRouter(0) → Port 4000
Start simpleOnionRouter(1) → Port 4001
Start simpleOnionRouter(2) → Port 4002

✅ Calls simpleOnionRouter(index) inside the loop
Each node is created dynamically with a unique nodeId.
This makes it easy to scale the network to any number of nodes.

✅ Uses Promise.all(promises) to ensure all servers start before returning  
Why is this necessary?  
simpleOnionRouter() is async (because listen() takes time).
We need to make sure all nodes start before we move forward.
Promise.all() waits for all routers to start before returning.  
ts  
'''
const servers = await Promise.all(promises);
'''  
This prevents issues where some nodes might not be ready when needed.

💡 Why is this important?  
This function automates node creation instead of requiring manual startup.
Ensures all nodes are up and running before messages are sent.