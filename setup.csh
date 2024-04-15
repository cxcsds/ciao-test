###############################################################
#
# Configure environment for running CIAOTEST
# regression-testing tools
#
###############################################################


#
# The following declarations will differ for each
# local installation
#
set ROOT=/proj/sds/Regression

# Installation directory for CIAOTEST software
setenv CIAOTEST_INSTALL ${ROOT}/ciaotest

# Directory containing test files
setenv CIAOTEST_TESTS ${ROOT}/current_regtest/tests

# Directory containing input files for tests
setenv CIAOTEST_INPUT ${ROOT}/current_regtest/input

# Directory to which test results are written
setenv CIAOTEST_RESULTS ${ROOT}/results

# Directory containing dmdiff tolerance files (optional)
setenv CIAOTEST_TOLFILES ${ROOT}/current_regtest/tolfiles


#
# The following declarations are the same for all
# installations
#

# Directory containing executable CIAOTEST scripts
setenv CIAOTEST_BIN $CIAOTEST_INSTALL/bin

# Directory containing definitions of internal CIAOTEST functions
setenv CIAOTEST_FUNCTIONS $CIAOTEST_INSTALL/lib

# Set PATH appropriately
setenv PATH "${CIAOTEST_BIN}:${CIAOTEST_FUNCTIONS}:${PATH}"

# Set FPATH so that ksh finds the functions defined in
# $CIAOTEST_FUNCTIONS

if (${?FPATH}) then
  setenv FPATH "${CIAOTEST_FUNCTIONS}:${FPATH}"
else
  setenv FPATH "$CIAOTEST_FUNCTIONS"
endif

unset ROOT

