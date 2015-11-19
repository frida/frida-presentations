#include <stdio.h>
#include <unistd.h>

void
f (int n)
{
  printf ("Number: %d\n", n);
}

int
main ()
{
  int i = 0;

  printf ("f() is at %p\n", f);

  while (1)
  {
    f (i++);
    sleep (1);
  }
}
