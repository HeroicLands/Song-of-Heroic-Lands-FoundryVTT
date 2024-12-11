#!/bin/bash
for i in leg-characters leg-creatures leg-characteristics leg-mysteries leg-possessions; do
    ./build-pack.sh $i
    [ $? ] || exit 1
done
