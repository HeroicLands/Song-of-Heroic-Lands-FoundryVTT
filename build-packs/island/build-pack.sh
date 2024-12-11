#!/bin/bash
PACK=$1
[ ! -d $1 ] && { echo -e "\033[0;31mERROR:\033[0m No such directory $PACK"; exit 1; }
cd $1
PACKTYPE=$(grep "^type=" pack.properties| cut -d= -f2)
[ -d build ] && rm -rf build
mkdir build
python3 ./generate-$PACK.py build
if [ $? -eq 0 ]; then
    [ -d unique -a ! -z "$( ls -A $PWD/unique/*.json 2>/dev/null )" ] && cp unique/*.json build
    fvtt package pack -n $PACK -v --type System --id sohl -t $PACKTYPE --in build --out ../../..
else
    echo -e "\033[0;31mERROR:\033[0m Build Failed!!"
    rm -rf build
    exit 1
fi
