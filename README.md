# REF / RREF Matrix Solver

A web-based Linear Algebra calculator that solves **Row Echelon Form (REF)** and **Reduced Row Echelon Form (RREF)** problems step by step.

The project allows users to enter any matrix size, calculate REF or RREF, and view every row operation used during the solution process.

Built using:

* HTML
* CSS
* JavaScript

No external libraries are required.

---

# Features

## Matrix Input

* User can choose:

  * Number of rows
  * Number of columns

* Supports small and large matrices.

Example:

```
1  2  3
4  5  6
7  8  9
```

---

## REF Solver

Calculates the Row Echelon Form of a matrix.

Example:

Before:

```
1  2  3
2  4  6
```

After REF:

```
1  2  3
0  0  0
```

---

## RREF Solver

Calculates the Reduced Row Echelon Form using Gauss-Jordan elimination.

Example:

Input:

```
1 2
3 4
```

Output:

```
1 0
0 1
```

---

## Step-by-Step Explanation

The calculator does not only show the final answer.

It displays:

* Row swaps
* Row multiplication
* Row addition/subtraction
* Pivot normalization
* Elimination steps

Example:

```
R₂ = R₂ - 2R₁
```

Then shows the matrix after the operation.

---

# How REF Works

REF (Row Echelon Form) follows Gaussian Elimination.

A matrix is in REF when:

1. All non-zero rows are above zero rows.

Example:

```
1 2 3
0 4 5
0 0 6
```

2. The first non-zero number in each row (pivot) is to the right of the pivot above it.

3. All values below each pivot are zero.

---

## REF Algorithm

### Step 1: Find Pivot

Start from the first column.

Find the first non-zero element.

Example:

```
0 2 3
1 4 5
```

The first pivot cannot be zero, so swap rows:

```
1 4 5
0 2 3
```

Operation:

```
R₁ ↔ R₂
```

---

### Step 2: Eliminate Below Pivot

Make all numbers below the pivot equal to zero.

Formula:

```
R₂ = R₂ - kR₁
```

where:

```
k = value below pivot / pivot value
```

Example:

```
2
```

below the pivot:

```
R₂ = R₂ - 2R₁
```

Result:

```
1 4 5
0 2 3
```

---

### Step 3: Move To Next Column

Repeat the process for the next pivot until the matrix reaches REF.

---

# How RREF Works

RREF extends REF by adding extra rules:

1. Every pivot must equal 1.

Example:

Before:

```
2 4
0 3
```

Normalize:

```
R₁ = R₁ / 2
R₂ = R₂ / 3
```

Result:

```
1 2
0 1
```

---

2. Every pivot column must contain only one non-zero value.

Example:

Before:

```
1 2
0 1
```

Remove the value above pivot:

```
R₁ = R₁ - 2R₂
```

Result:

```
1 0
0 1
```

---

# RREF Algorithm

The program performs:

## 1. Convert Matrix to REF

First:

```
Gaussian Elimination
```

creates:

```
1 * *
0 1 *
0 0 1
```

---

## 2. Normalize Pivot Rows

Make every pivot equal to 1.

Example:

```
2 4 6
```

becomes:

```
1 2 3
```

Operation:

```
R₁ = R₁ / 2
```

---

## 3. Eliminate Above Pivots

Remove values above each pivot.

Example:

```
1 3
0 1
```

Operation:

```
R₁ = R₁ - 3R₂
```

Result:

```
1 0
0 1
```

---

# Code Structure

```
rref_calculator/

│
├── index.html
│
├── style.css
│
└── script.js
```

---

# JavaScript Logic

## Matrix Creation

The user chooses rows and columns.

The program dynamically creates input fields.

Function:

```javascript
createMatrix()
```

---

## Reading Matrix

The entered values are converted into a JavaScript array.

Function:

```javascript
getMatrix()
```

Example:

HTML inputs:

```
1 2
3 4
```

Converted to:

```javascript
[
 [1,2],
 [3,4]
]
```

---

## REF Function

Main function:

```javascript
REF(matrix)
```

Responsibilities:

* Find pivots
* Swap rows
* Eliminate values below pivots
* Save every step

---

## RREF Function

Main function:

```javascript
RREF(matrix)
```

Responsibilities:

* Apply REF first
* Normalize pivots
* Remove values above pivots
* Generate final reduced matrix

---

## Step Saving

Every operation is stored:

```javascript
saveStep()
```

Example:

```javascript
{
 operation:"R2 = R2 - 2R1",
 matrix:[
  [1,2],
  [0,3]
 ]
}
```

Then displayed to the user.

---

# Future Improvements

Possible future features:

* Fraction display
* LaTeX mathematical rendering
* Matrix inverse
* Determinant calculator
* Vector operations
* Eigenvalues and eigenvectors
* Linear equation solver
* Dark mode
* Export solution as PDF

---

# Purpose

This project was created to make Linear Algebra operations easier to understand by showing the complete solving process instead of only displaying the final answer.
