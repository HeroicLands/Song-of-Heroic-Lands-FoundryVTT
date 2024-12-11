#!/bin/bash
PACK=$1
PACKBASE=../../assets/packs/legendary/$PACK
DATADIR=$PACKBASE/data
BUILDDIR=build/$PACK
PACKDIR=../../packs
GENFILE=generate-$PACK.py
[ ! -f $GENFILE ] && { echo -e "\033[0;31mERROR:\033[0m No such file $GENFILE"; exit 1; }
PACKTYPE=$(grep "^type=" $PACKBASE/pack.properties| cut -d= -f2)
[ -d $BUILDDIR ] && rm -rf $BUILDDIR
mkdir -p $BUILDDIR
python3 ./generate-$PACK.py $DATADIR $BUILDDIR
if [ $? -eq 0 ]; then
    [ -d unique -a ! -z "$( ls -A $PACKBASE/unique/*.json 2>/dev/null )" ] && cp $PACKBASE/unique/*.json build
    fvtt package pack -n $PACK -v --type System --id sohl -t $PACKTYPE --in $BUILDDIR --out $PACKDIR
else
    echo -e "\033[0;31mERROR:\033[0m Build Failed!!"
    rm -rf $BUILDDIR
    exit 1
fi
