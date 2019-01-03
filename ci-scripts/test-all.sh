#!/bin/bash

package_name=`npm list null | head -n1`
echo lol.com/`echo $package_name | cut -d'@' -f-2`/`echo $package_name | cut -d'@' -f3 | cut -d' ' -f1`

