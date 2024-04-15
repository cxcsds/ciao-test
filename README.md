# SDS CIAO testing harness scripts

This repro contains a copy of the scripts used to run the CIAO 
regression tests.

The tests themselves together with their data files are stored locally
due to their size (~80 Gb)

The general design is based on testing individual CIAO tools; however,
the framework has been adapted to make it work with things like 
scripts and threads.

## Local Files

For all the gory details about the regression test system see 
[Nick Durham's User's Guide](https://icxc.cfa.harvard.edu/sds/ciao_testing/regtest/).
This will just summarize the layout of the system.

All the files live in 

`/data/sdsreg`

The test scripts, input files, and `dmdiff` tolerance files live in the
`current_regtest` directory.  

```bash
$ tree -L 1 -d current_regtest
current_regtest
├── input
├── tests
├── threads_tests
└── tolfiles
```

The baseline outputs are in the `results` directory.

### `tests`

The `tests` directory contains a directory for each "tool".  In each
tool's directory are a collection of `*.MAIN` shell scripts 
and possibly `*.AUX` auxiliary scripts.  The `*.MAIN` tests are 
run using `ksh`. The test harness takes care of all the directory
setup, setting `PFILES`, setting `ASCDS_WORK_PATH`, and redirecting 
stderr+stdout to a `LOG` file.  The `*.MAIN` files should access files
in the `input` directory using the `$CT_INDIR` variable.

The `*.AUX` file is run after the `*.MAIN`. The best use of this is
to tweak the LOG file.  For example, removing hard coded paths, 
specific version strings, etc.  The stdout+stderr output from the 
`AUX` scripts is **not** redirected to the `LOG` file.

Historically, many of the tests dirs also contain a "sources.txt" 
file that provides a link to say an SDS worksheet that the test
was created from.  It's recommended instead to put this information
into the test script itself as a comment to keep everything together.


### `input`

The input directory has subdirectories corresponding to the tools
in the `tests`. The layout below that is free form.  Since some tools
use the same input file for multiple tests it may make more sense to
have no directory structure and conversely some tools require a certain
hierarchy (eg chandra_repro). 

### `tolfiles`

The `tolfiles` directory contains `dmdiff` tolerance files for each tool.
If there is not a tool specific tolerance file, then the `DEFAULT.tol` file
is used.

This is where the single-tool framework is limiting.  For many scripts
that generate many outputs from many different (compiled) tools, a single
tolerance file does not always make a lot of sense.  We end up putting
a lot of single-tool specific stuff in and have to be careful it doesn't
conflict with another tool's tolerances.


### Threads

There is also the `threads_tests` dir which contains the `*.MAIN` 
files for the CIAO threads.

The threads are maintained as bash-kernel Jupyter notebooks in the

```
/data/sdsreg/thread_output/Notebooks/
```

directory.  The threads always download the latest files from the archive
so there is no corresponding `input` folder for them.  The threads
also generate so many outputs from so many different tools that the 
tool tolerance files scheme just doesn't work.

Generally when we compare the threads outputs we manually compare the
output logs.

### Baseline Outputs

We maintain separate baseline output files for Linux and macOS. (Technically
we should also have macOS x86 vs. amd, but the diffs there are fewer). 

The baseline outputs are kept in

```
/data/sdsreg/results/ciao_linux64_baseline_repro/
/data/sdsreg/results/ciao_osx_baseline_repro/
```

The baseline outputs are kept up to date
(generally) with the current version of CIAOX using the current version
of the CALDB.


## Setup

There are `bash` and `tcsh` setup scripts in the root directory to 
setup all the necessary environment variables.  The expectation is 
that users only need to modify the `ROOT` variable for their local
repro. 

```bash
tcsh% source setup.csh
  or
bash$ source setup.sh
```

The baseline outputs are kept up to date with the current version of
CIAOX/T and the current CALDB.  We do not keep versioned copies of the
inputs nor the baseline save files. 


## Example session

Here is an example of how to run the standard suite of regression tests

First be sure to setup for CIAO and MARX

```bash
source /exort/ciaox/bin/ciao.csh
source /exort/ciaox/marx-*/setup_marx.csh
```

and then run the tests

```bash
source setup.csh
cd $CIAOTEST_RESULTS
parallel_run_and_compare ciao_linux64_baseline_repro ciaox_20200828_Linux &
serve_results ciao_linux64_baseline_repro-ciaox_20200828_Linux &
gio open http://localhost:8080
```

## Summary of tasks

This is a summary of the high level tasks.

### `parallel_run_and_compare`

Usage: 

```bash
parallel_run_and_compare baselineset testset [-u] [tests]
```

Used to run and compare a new regression test set to the baseline test
set.

This script keeps track of the running tests using an sqlite3 database.
To store all the diff comparison outputs and for the sqlite3 database file
the script creates the directory

```baselineset-testset```

(that is the two directory names are joined together with a hyphen, "-", between). 
So for example running

```parallel_run_and_compare my_baseline my_tests```

will create the directory `my_baseline-my_tests` and the sqlite3 database
```my_baseline-my_tests/results.sqlite```

The `-u` flag tells the script to update the existing test database
otherwise a new database is created.

The baseline can be set to `none` to skip comparison.

Individual tools and individual tests can be run as the other test tools.

Calls:

- `list_tests`
- `run_tests`
- `compare_results`

The `serve_results` script can be used to monitor the progress
of the test.



### `serve_results`

Usage: 

```bash
serve_results baselineset-testset [port]
```

This application creates a small web server 
using [bottle](https://bottlepy.org/docs/dev/) that can be used to monitor
the regression tests run by the `parallel_run_and_compare` test.

This script should be started in a separate window using the same
setup as `parallel_run_and_compare`.  Once the script is started,
you should pointer your web browser to the URL provided, usually

http://localhost:8080/


Calls:

- none

### `run_tests`

Usage 

```bash
run_tests outdir [tests]
```

Used to run the test scripts (ie the `*.MAIN` files).  Data are not
compared|checked.

Calls:

- none



### `run_and_compare`

Usage: 

```bash
run_and_compare baselineset testset [tests]
```

Used to run and compare a new regression test set to the baseline test
set.

Calls:

- `smart_compare`: on baseline and test sets
- `compare_results`: on the `compare.dat` file written out to `compare.log`



### `smart_compare`

Usage: 

```bash
smart_compare baselineset testset [tests]
```

Takes `smart_diff` output and creates an exit status log for each test.

- creates `smart_compare` directory
- creates `compare.dat`

Calls:

- `smart_diff`


### `compare_results`

Usage

```bash
compare_results -d compare.dat
```

creates `compare.log` file with pass/fail/summary info


### `smart_diff`

Usage:

```bash
smart_diff [-d] [-i] [-l log] /path1/tool/test/file /path2/tool/test/file
```

The big comparison script.  Edits can be made here to the diff
process.

### `print_test`

Usage:

```bash
print_test tool testid
```

This will display the test's .MAIN file, 
replacing the $CT_INDIR with the correct location.


### `bless`

Usage:

```bash
cd .../tool/testid
bless filename
```

The `bless` script is used to copy files from the current directory 
into the baseline repro. It should be used cautiously as this makes the
output the new baseline.  To that end, it only allows one file at a time
and forces the user to create the directory in the baseline repro if
it doesn't already exist.

Note: the paths are hard coded and may need to be tweaked, especially
for macOS fuse mount.


## Specifying individual tests

Users can specify individual tests in the following ways:

```bash
run_tests outdir dmlist
```

will run all the `dmlist` tests.


```bash
run_tests outdir dmlist 01
```

will run the single `dmlist` `01.MAIN` test.

```bash
run_tests outdir "file(/path/to/my.lis)"
```

Individual tests can be specified in a list file.  Each line is a 
different test and should contain the tool name and test-id separated 
by white space.  You need to use the full path name to the list file.



## Authors

Most of these script were written by N. Durham, E. Galle, and C. Stawarz.
They (unfortunately) are mostly `ksh` scripts.  Minor tweaks have been
made by N. Lee and K. Glotfelty.
