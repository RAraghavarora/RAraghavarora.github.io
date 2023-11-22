---
title: "Molecular Property Prediction using Neural Networks"
teaser: images/TCP.jpg
permalink: /dftb/overview/
header:
    overlay_color: "#777"
excerpt: "This is a part of my master's thesis at BITS Pilani, done under the guidance of [Prof. Alexandre Tkatchenko](https://scholar.google.com/citations?user=o2t1Pv8AAAAJ) and the supervision of [Dr. Leonardo Sandonas](https://scholar.google.com/citations?user=gQ9rSZ0AAAAJ)."
categories:
    - Article
tags:
    - Quantum Chemistry
    - Neural Networks
    - Kernel Ridge Regression
    - Machine Learning
    - DFTB
---
{% include toc %}
### Introduction
Traditional ways of getting a molecule's properties, (such as the HOMO-LUMO gap, the Hartree energy or a simple atomization energy) involve the use of quantum chemical simulations. To accurately know the properties of any system, we need to solve the Schrödinger's equation, but unfortunately the coulomb repulsion of electronic interactions makes it impossible to 'accurately' solve the equation for any non-hydrogen atom (Because of the existence of more than 1 electron). 

Time dependent Schrödinger's equation is written as:  
-ħ^2/(2m) ∂^2Ψ(x, t)/∂x^2 + V(x)Ψ(x, t) = iħ ∂Ψ(x, t)/∂t

Hence, traditional quantum chemical simulations make use of approximations to simplify the system. For example, we first write the time independent Schrödinger's equation by splitting the wave function into a spacial component and a temporal component. Next, we write the multi-electron wave-function as a product of single electron wave functions:  
ψ(r₁,r₂,⋯,rᵢ) ≈ φ₁(r₁)φ₂(r₂)⋯φᵢ(rᵢ)


There are multiple such approximations which are able to give us the energy of multi-electron and multi-atom systems to a certain level of accuracy. 
Although these simulations are able to provide us with really accurate results, they are very computationally extensive and take a long time to complete. 
Another traditional method is the use of Molecular Dynamics simulations which make use of Newtonian force fields and are faster than quantum simulations. There is a clear tradeoff of performance for time here. 

The aim of this project is to achieve the results of quantum simulations while not compromising on time by the use of deep learning methods. 

### Architectures
To be continued - Will be updated soon  
Meanwhile, check out my [thesis](/PDFs/thesis.pdf)