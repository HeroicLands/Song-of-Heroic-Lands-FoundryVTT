#!/bin/bash
# Build Items first
for i in leg-characteristics leg-mysteries leg-possessions; do
    ./build-pack.sh $i
    [ $? ] || exit 1
done

# Build Actors last
for i in leg-characters leg-creatures; do
    ./build-pack.sh $i
    [ $? ] || exit 1
done
