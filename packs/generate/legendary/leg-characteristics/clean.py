#!./venv/bin/python3

from ruamel.yaml import YAML
from ruamel.yaml.scalarstring import LiteralScalarString
import json
import argparse
from unidecode import unidecode
from mergedeep import merge
from lxml import etree, html
import re
import sys, textwrap
from bs4 import BeautifulSoup as bs

def LS(s):
    return LiteralScalarString(textwrap.dedent(s))

yaml = YAML()

with open("./data/traits.yaml", "r", encoding="utf8") as infile:
    traitsData = yaml.load(infile)

for trait in traitsData:
    if trait["description"]:
      soup = bs(LS(trait["description"]), features="lxml")
      trait["description"] = soup.prettify();

yaml.dump(traitsData, sys.stdout)
