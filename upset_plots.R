library(ComplexUpset)
library(ggplot2)

data <- data.frame(
  A = c(TRUE, TRUE, FALSE, TRUE, FALSE),
  B = c(TRUE, FALSE, TRUE, TRUE, FALSE),
  C = c(FALSE, TRUE, TRUE, TRUE, TRUE),
  D = c(TRUE, FALSE, FALSE, TRUE, TRUE)
)

ComplexUpset::upset(data, intersect = c("A", "B", "C", "D"))