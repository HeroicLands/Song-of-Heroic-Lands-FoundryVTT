#!/bin/bash
for i in isle-possessions; do
    ./build-pack.sh $i
    [ $? ] || exit 1
done
