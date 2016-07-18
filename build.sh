rm -r /var/www/html/*
jekyll build
cp -r _site/* /var/www/html
